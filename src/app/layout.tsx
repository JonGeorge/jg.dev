import type {ReactNode} from "react";
import type {Metadata} from "next";
import localFonts from "next/font/local";
import "./globals.css";
import {ThemeProvider} from "@/components/ThemeProvider";

const lora = localFonts({
    src: [
        {path: "../lib/fonts/Lora-Regular.ttf", weight: "400"},
        {path: "../lib/fonts/Lora-Bold.ttf", weight: "700"}
    ],
    variable: "--font-lora",
    display: "swap",
});

const dmSans = localFonts({
    src: [
        {path: "../lib/fonts/DMSans-Regular.ttf", weight: "400"}
    ],
    variable: "--font-dm-sans",
    display: "swap"
});

const jetBrainsMono = localFonts({
    src: [
        {path: "../lib/fonts/JetBrainsMono-Regular.ttf", weight: "400"}
    ],
    variable: "--font-mono",
    display: "swap"
});

export const metadata: Metadata = {
    metadataBase: new URL("https://jg.dev"),

    title: "Jon George",

    description: "Engineering leader & software architect. Currently building Explodex (AI ordnance identification) and SoftwareDB.",

    openGraph: {
        title: 'Jon George',
        description: 'Engineering leader & software architect. Currently building Explodex (AI ordnance identification) and SoftwareDB.',
        url: 'https://jg.dev',
        siteName: 'jg.dev',
        images: [{url: '/1200x630.png', width: 1200, height: 630, alt:'Jon George — Engineering leader & software architect. Currently building Explodex (AI ordnance identification) and SoftwareDB.'}],
        locale: 'en_US',
        type: 'website',
    },

    twitter: {
        card: 'summary_large_image',
        title: 'Jon George',
        description: 'Engineering leader & software architect. Currently building Explodex (AI ordnance identification) and SoftwareDB.',
        creator: '@jongeorgedev',
        images: ["/1200x630.png"],
        site: '@jongeorgedev',
    },

    /**
     * Since metadataBase is defined above, Next.js resolves './' against the current route automatically.
     * So "/writing/zero-trust-in-code" becomes "https://jg.dev/writing/zero-trust-in-code" without needing to hardcode
     * the domain or slug anywhere. That said, for the "post" page you can skip setting alternates entirely since the
     * root layout's canonical: './' already applies to every page in the tree through metadata merging. You only need
     * to override it on a specific page if the canonical differs from the actual URL.
     */
    alternates: {
        canonical: './',
        types: {
            'application/rss+xml': '/feed.xml',
            'application/atom+xml': '/feed.atom',
            'application/feed+json': '/feed.json',
        }
    },

    icons: {
        icon: "/32x32.png",
        apple: "/512x512.png",
    },

    authors: [{ name: 'Jon George'}],

    creator: 'Jon George',

    publisher: 'Jon George',

    other: {
        "fediverse:creator": "@jg@jg.dev",
    }
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            {/*{Mastodon Verification: When I link to jg.dev from my Mastodon profile, they will check that the jg.dev links back to my profile and show a visual indicator on it.}*/}
            <link rel="me" href="https://social.jg.dev/@jg" />
        </head>
        <body
            className={`${lora.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-sans antialiased bg-(--color-bg) text-(--color-text-primary) transition-colors duration-300`}
        >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
