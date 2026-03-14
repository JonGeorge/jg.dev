---
title: Process 1M+ records in ServiceNow without killing your instance
date: 2026-03-13T00:00:00.000Z
author: Jon George
description: A decision framework for large-scale data operations in ServiceNow, and the event-driven recursion pattern I use when nothing else works.
category: Engineering
---
Every ServiceNow developer eventually needs to run a scripted operation across hundreds of thousands of records. Maybe you're backfilling a computed field, reclassifying CIs, reconciling data between tables, or cleaning up records that should have been purged years ago. You write a GlideRecord loop, paste it into Background Scripts, and hit Run. Then one of three things happens. The script times out. The instance slows to a crawl. Or both.

This is a real problem, but the answer isn't obvious because the right approach depends on what you're actually doing to each record. A simple field update and a complex reclassification are fundamentally different operations, and the tooling that handles one will choke on the other.

This post is a decision framework. I'll walk through every approach I've used, when each one works, and when it breaks down. Then I'll go deep on the pattern I reach for when nothing else fits, event-driven recursion with nested batching.

## Know what you're dealing with

Before choosing an approach, answer two questions:

*Does your operation require scripting logic per record?* If you're setting field A to value B across every record that matches condition C, that's a static update. If you're computing a value based on related records, calling a script include, doing cross-table lookups, or applying conditional logic that varies per record, that's a scripted operation. 

*How many records do you need to process?*
Hundreds, thousands, hundreds of thousands, millions? The approaches that work at 5,000 records will fail at 500,000. Scale changes the physics.

This distinction determines which tools are automatically off the table (pun intended).

## The approaches, in order of complexity

#### Update All from list view

Filter a list, right-click a column header, select Update All, set the new value. It works. It's fast. No scripting required. This is the right choice for small to moderate datasets — a few thousand records — where you're setting fields to a uniform value.

If you're in a pinch, you can use update all on a larger number of records, just be prepared for your session to be locked while you wait for the operation to complete. You'll also need to re-run the operation on remaining records after it times out. 

Update All breaks down the moment you need per-record logic, and it doesn't scale well past a few thousand records because the UI transaction will time out. If your update involves removing field values, you can set string values to `NULL{:js}`, but date fields can't be cleared.

Use it when: you need a quick, uniform field update on a filtered set you can see in a list.

Skip it when: you need any logic beyond "set X to Y," or you're operating on more than a few thousand records.

#### Data Management (Update Jobs / Delete Jobs)

ServiceNow's System Data Management module is a no-code tool for bulk updates and deletes. You configure conditions, specify field values, and execute. It handles batching internally, you can schedule it, and it has built-in rollback, which is actually useful.

For static updates, Data Management is the right answer. If your operation is something like "set category to 'network' where description contains 'network' and category is not 'network'," use Update Jobs. Don't over-engineer it. The rollback capability alone justifies using it over a script.

But Data Management only supports setting fields to static values. It doesn't support computed values, cross-table lookups, conditional transforms, or any per-record scripting logic. I've seen people try to use JavaScript syntax in the value fields — it doesn't work well. The moment your operation requires a script, Data Management is out.

There are also operational caveats. Updating all records in a table can temporarily lock the table, preventing inserts and updates. And the scheduling feature has been unreliable in my experience. Jobs sometimes sit in a "New" state and never fire, while "Execute Now" works fine. Not a dealbreaker, but worth knowing.

Use it when: you need a bulk field update with static values and want built-in rollback.

Skip it when: your operation requires per-record scripting logic.

#### Background script with setLimit or chooseWindow

This is where most developers land first for scripted operations. Write a GlideRecord loop, use `setLimit(){:js}` or `chooseWindow(){:js}` to process a subset, run it, adjust the window, run it again recursively or manually.

It works at moderate scale — tens of thousands of records. But the entire background script runs in a single transaction, and the transaction timeout clock starts when you hit Run. Calling functions recursively within the script doesn't reset the timer. The default background script quota is 4 hours, and transaction quota rules may enforce tighter limits depending on your instance configuration.

For larger datasets, this approach means manually re-running the script over and over, adjusting your query window each time. That's too much babysitting. It's fine for a one-time operation on 50,000 records. It's not viable for 1M+.

Use it when: you have a scripted operation on a moderate dataset (under ~100K records) and you're willing to babysit a few runs.

Skip it when: the dataset is large enough that re-runs become impractical, or when you need the operation to run unattended.

#### Scheduled job on a recurring interval

The next step up: create a scheduled job that processes a batch of records on a fixed interval. Run every 5 minutes, process 500 records per run. Walk away.

The problem is the interval math. You have to set the interval longer than your worst-case batch execution time to prevent jobs from piling up. If you're conservative (and you should be, because instance load varies), you waste time when the instance is idle.

Tim Woodruff illustrated this well in his [SNProTips article on event-driven recursion](https://snprotips.com/blog/2018/10/11/how-to-do-massive-slow-database-operations-without-slowing-down-your-instance): if each operation takes 10-60 seconds and you're doing 20 records per batch with a conservative interval, processing 100,000 records could take 83 days. That's not a typo.

Scheduled jobs are the right tool for ongoing maintenance. It's great for a nightly cleanup or a weekly reconciliation. It's the wrong tool for one-off large-scale operations where you want the work done as fast as the instance allows.

Use it when: you need a recurring maintenance operation that processes records in perpetuity.

Skip it when: you have a one-off large-scale operation and need it done in hours or days, not months.

#### Event-driven recursion

This is the pattern I reach for when every other option has a dealbreaker: the operation requires per-record scripting, the dataset is too large for manual re-runs, and a scheduled job is too slow.

The core idea, originally documented by Woodruff, is simple: register an event, create a script action that processes a batch and then fires the same event again, and kick it off with a background script. 

Each event fires a new script action in a **new transaction**, which genuinely resets the timeout clock. The next batch only fires after the current one completes, so there's no pile-up. And because each event goes to the back of the event queue, the instance self-throttles as needed. Batches run slower when the queue is busy, faster when it's idle.

This is the pattern I use the most, with some refinements I'll cover below.

## Implementing event-driven recursion

The pattern has three components: 
1. an event registration
2. a script action
3. and a one-time background script to kick off the first event

#### Step 1: Register the event

Navigate to **System Policy > Events > Registry** and create a new event. Give it a descriptive name, something like `custom.batch.backfill_field{:plain}`. Add a short blurb about what triggers the event in the `Fired by` field. And add a description.

#### Step 2: Create the script action

Navigate to **System Policy > Events > Script Actions** and create a new record. Set the **Event name** to the event you registered. Set **Order** to 1000 (low priority - you don't want this competing with critical event processing).

Here's the what the Script Action looks like:

```js
/**
 * Event-driven recursive batch processor.
 * Processes records in batches, firing a new event after each
 * batch to reset the transaction timeout and prevent instance
 * degradation.
 *
 * @param {number} batchSize - Records to process per event 
 * (via event.parm1)
 *
 * @param {number} totalProcessed - Running count of processed
 * records (via event.parm2)
 */
(function process(batchSize, totalProcessed) {

    var EVENT_NAME = 'custom.batch.backfill_field'; 
    var TABLE = 'incident';
    var QUERY = 'u_custom_field=NULL';

    batchSize = parseInt(batchSize, 10) || 5000;
    totalProcessed = parseInt(totalProcessed, 10) || 0;

    var gr = new GlideRecord(TABLE);
    gr.addEncodedQuery(QUERY);
    gr.setLimit(batchSize);
    gr.query();

    if (!gr.hasNext()) {
        gs.info(
	        'EDR Complete: ' + totalProcessed + 
	        ' total records processed.',
	        'BatchProcessor'
	    );
        return; // No more records. Stop the recursion.
    }

    var batchCount = 0;
    while (gr.next()) {
    
        // ------- YOUR PROCESSING LOGIC HERE -------
        gr.setValue('u_custom_field', computeValue(gr));
        gr.setWorkflow(false); // Skip business rules if safe
        gr.update();
        // -------------------------------------------
        
        batchCount++;
    }

    totalProcessed += batchCount;
    gs.info(
	    'EDR Progress: ' + totalProcessed +
	    ' records processed. Firing next batch.', 
	    'BatchProcessor'
    );

    gs.eventQueue(EVENT_NAME, gr, batchSize, totalProcessed);

})(event.parm1, event.parm2);
```

A few things to note about this template:

**The query must exclude already processed records.** This is what makes the pattern resumable. If your operation sets a field from NULL to a computed value, query for records where that field is still NULL. Each batch processes records that match the query, transforms them so they no longer match, and the next batch picks up where this one left off. If the process fails mid-run, you restart it and it automatically skips records that were already processed.

**`setWorkflow(false){:js}` is your friend, when appropriate.** Every `gr.update(){:js}` fires every business rule, workflow, and/or notification on that table. On a table with heavy automation, this can be the difference between processing 5000 records per batch and 50. But only suppress workflows if your operation genuinely doesn't need the side effects. If you're reclassifying CIs and downstream processes need to react to the class change, leave workflows on and reduce your batch size.

Also note that `setWorkflow(false){:js}` means that the `Updated` date/time and `Updated by` fields will not be updated.

**Log progress consistently.** When this runs across a million records, you need to know where it is. The `gs.info{:js}` calls with a consistent source tag (`BatchProcessor{:js}`) let you filter the system log and watch progress in real time.

#### Step 3: Kick it off

Run this once in Background Script or Fix Script to fire the first event:

```javascript
gs.eventQueue(
	'custom.batch.backfill_field', 
	new GlideRecord('incident'), 
	5000, 
	0
);
```

The first parameter is the batch size (5000 records per event), the second is the starting count (0). The script action handles everything from here.

When running this from a Fix Script, the record updates from the script action will **not** be recorded for roll back.

## Nested batching: batches within the batch

Here's a refinement I use that goes beyond the base pattern. Within a single script action execution, I process records using a recursive function that operates on sub-batches.

```javascript
(function process(batchSize, totalProcessed) {

    var EVENT_NAME = 'custom.batch.backfill_field';
    var TABLE = 'incident';
    var QUERY = 'u_custom_field=NULL';
    var SUB_BATCH_SIZE = 1000;

    batchSize = parseInt(batchSize, 10) || 50_000;
    totalProcessed = parseInt(totalProcessed, 10) || 0;

    var batchCount = 0;

    function processSubBatch() {
        var gr = new GlideRecord(TABLE);
        gr.addEncodedQuery(QUERY);
        gr.setLimit(SUB_BATCH_SIZE);
        gr.query();

        if (!gr.hasNext()) {
            return false; // No more records
        }

        while (gr.next()) {
        
            // ------- YOUR PROCESSING LOGIC HERE -------
	        gr.setValue('u_custom_field', computeValue(gr));
	        gr.setWorkflow(false); // Skip business rules if safe
	        gr.update();
	        // -------------------------------------------
	        
            batchCount++;
        }

        // If we haven't hit the outer batch limit, recurse
        if (batchCount < batchSize) {
            return processSubBatch();
        }
        return true; // More records exist
    }

    var moreRecords = processSubBatch();

    totalProcessed += batchCount;
    gs.info(
	    'EDR Progress: ' + 
	    totalProcessed + ' records processed (' + 
	    batchCount + ' this batch).'
    );

    if (moreRecords) {
        gs.eventQueue(
	        EVENT_NAME, 
	        new GlideRecord(TABLE), 
	        batchSize, 
	        totalProcessed
	    );
    }
    else {
        gs.info(
	        'EDR Complete: ' + 
	        totalProcessed + ' total records processed.'
        );
    }

})(event.parm1, event.parm2);
```

The outer `batchSize{:js}` controls how many records are processed per event (per transaction). 
The inner `SUB_BATCH_SIZE{:js}` controls how many records are queried and processed per recursive function call within that transaction.

I want to be transparent about why I use this structure. In my experience, I've consistently observed that using recursive sub-batch calls within a single script action lets me process significantly more records per event, roughly 30,000-50,000 per event compared to 10,000-15,000 with a flat loop. But I haven't been able to isolate exactly why.

A few hypotheses. The recursive function calls may scope variables more tightly, allowing the JavaScript engine to garbage collect more efficiently between sub-batches. The transaction quota manager may check elapsed time at specific intervals rather than continuously, and the execution profile of the recursive structure may squeeze more work between checks. Or it could be a measurement artifact? Instance load varies, and without controlled benchmarking, the difference could be coincidental.

I use the pattern anyway because the throughput improvement has been consistent enough across multiple operations to be worth including. But I'm presenting it as a technique worth testing in your environment, not a guaranteed optimization. If you benchmark this and find a clearer explanation, I'd like to hear about it.

## Operating the pattern in production

The mechanics of the pattern are straightforward. The operational details are where things get real.

#### Monitoring progress

Filter the system log by your source tag and sort by timestamp. You'll see a running count of processed records with timing between entries. If the gap between log entries suddenly increases, the instance is under load and the event queue is backing up. If entries stop appearing entirely, something went wrong. Check the most recent log entry for error context.

For long-running operations, I'll sometimes add a GlideAggregate call at the start of each batch to count remaining records matching the query. This gives you an estimated completion percentage, not just a running total.

#### Handling failures

The beauty of the query-based approach is that it's inherently resumable. If a batch fails partway through, the records that were already processed no longer match the query. You just fire the event again and it picks up from where it stopped.

Design your query so that processing a record removes it from the result set. This is the single most important design decision in the pattern.

#### Event queue considerations

Each batch fires one event. If you're processing a million records at 50,000 per batch, that's 20 events over the course of the operation. This is fine for the default event queue.

But if your batch size is small (say, 50 records because each operation is expensive) and your dataset is large, you'll generate thousands of events. At that scale, you can clog the default event queue and delay processing of other events like notifications, integrations, anything that runs through the same queue. ServiceNow provides a mechanism to create dedicated event queues for exactly this scenario. Move your batch processing event to its own queue so it doesn't compete with production event processing.

#### Business rules and side effects

I mentioned `setWorkflow(false){:js}` earlier. Here's when to think carefully about it.

If you're doing a data cleanup or backfill where no downstream systems need to react then use `setWorkflow(false){:js}`. The performance difference is dramatic. On a table with 10+ business rules, turning off workflows can increase your throughput by an order of magnitude.

If you're doing a reclassification or status change where other systems, notifications, or audit trails need to reflect the change, then leave workflows on. Reduce your batch size to compensate, and accept that the operation will take longer. Correctness beats speed.

There's no universal answer. Know your table's automation landscape before you decide.

#### Testing before you commit

Never run a batch operation at scale without validating the logic on a small subset first.

Set your initial batch size to 10. Fire one event. Check the 10 records it processed. Are the values correct? Did the right business rules fire (or not fire)? Did anything unexpected happen in the system log?

Then bump it to 100. Then 1,000. Watch the instance performance dashboard. If you're seeing degradation, reduce the batch size. The pattern is self-throttling via the event queue, but a batch that's too large can still spike resource usage within a single transaction.

The batch and sub-batch sizes are levers and knobs that allow you to fine tune the processing  performance. There are variations in performance between sub-prod and production environments to consider. From my experience, production usually performs better than sub-prod, but your mileage may vary.

## When to use what

If this post gives you one thing, make it this:

**Static field update on any number of records →** Data Management Update Jobs. No scripting needed, rollback included.

**Scripted operation on under ~100K records →** Background script with `setLimit(){:js}`. Manual, but manageable.

**Scripted operation on 100K+ records →** Event-driven recursion. Set it up once, kick it off, monitor progress.

**Recurring maintenance operation →** Scheduled job. Built for this.

The event-driven recursion pattern isn't clever. The skill is recognizing when you need it and when a simpler tool will do the job.