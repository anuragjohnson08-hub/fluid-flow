import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export interface CardEdgeToEdgeProps {
  onAccept?: () => void
  onDecline?: () => void
}

export function CardEdgeToEdge({ onAccept, onDecline }: CardEdgeToEdgeProps = {}) {
  const [decision, setDecision] = useState<"accepted" | "declined" | null>(null)

  return (
    <Card className="mx-auto w-full max-w-sm" data-testid="card-edge-to-edge">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Terms of Service (Test Site Rant)</CardTitle>
          {decision && (
            <span
              data-testid="terms-decision-badge"
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                decision === "accepted"
                  ? "border border-white/35 bg-white/10 text-white"
                  : "border border-neutral-600 bg-neutral-900 text-neutral-300"
              }`}
            >
              {decision === "accepted" ? "Accepted" : "Declined"}
            </span>
          )}
        </div>
        <CardDescription>
          Please read this absurdly long test-site disclaimer and solo-dev rant before entering Fluid Flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="-mb-(--card-spacing)">
        <div className="-mx-(--card-spacing) max-h-48 space-y-4 overflow-y-scroll border-t border-[#262626] bg-muted/50 px-(--card-spacing) py-4 text-sm leading-relaxed text-[#a3a3a3]">
          <p>
            <strong className="text-white">1. THIS IS 100% A TEST SITE:</strong>{" "}
            First and foremost, let us get one thing crystal clear before you click
            a single glowing emerald button: this entire website is a live test
            build, a sandbox prototype, and an active experiment. Nothing you type
            into the waitlist box is saved to a secret server, no newsletters are
            going to flood your inbox, and no actual subscriptions exist here. If
            you enter your email at the bottom of the page, it literally just checks
            whether you typed an &ldquo;@&rdquo; symbol and pats you on the back.
          </p>
          <p>
            <strong className="text-white">2. WHY DOES THIS SITE EVEN EXIST?</strong>{" "}
            Fluid Flow started as a simple idea: one single place to check game
            reviews without wading through ten paragraphs of sponsored filler just
            to find out if a game is actually fun. Every title gets rated on three
            things that actually matter (Story, Graphics, and Action) and receives one
            brutally honest verdict: <span className="text-white font-semibold">Perfect</span>,{" "}
            <span className="text-neutral-300 font-semibold">Okish</span>, or{" "}
            <span className="text-neutral-400 font-semibold">Time Waste</span>. That should have been
            easy to build, right? Wrong.
          </p>
          <p>
            <strong className="text-white">3. THE 3:00 AM UI &amp; ANIMATION RANT:</strong>{" "}
            Do you have any idea how many hours went into making tiny details on this
            test site behave? Look at the background behind this popup: those stars
            are drifting upward in a custom parallax loop just so the page feels
            alive. Look at the dashboard header: those three little window dots are
            bouncing in place on a staggered cubic-bezier spring curve, and on
            mobile screens they double as an interactive drawer trigger because
            regular hamburger menus were apparently too boring.
          </p>
          <p>
            <strong className="text-white">4. THE WATER JARS &amp; 3D PIE CHART MADNESS:</strong>{" "}
            Normal review sites use flat horizontal bars. Not here. On this site we
            have glass jars that pour and slosh emerald liquid with scroll-reactive
            light glints, right next to a custom-projected isometric 3D pie chart
            that extrudes cylinder walls in real time without a heavy 3D engine.
            Every time you switch a sidebar tab in the dashboard, the jars re-pour
            and the numbers count up from scratch. Why? Because we wanted it to look
            cool.
          </p>
          <p>
            <strong className="text-white">5. THE MOUSE TRACKER &amp; Z-INDEX WARFARE:</strong>{" "}
            As you move your cursor around the page, an ambient emerald spotlight
            follows you across the void, until it hits a dark obsidian card panel,
            where it politely hides behind the surface layer so it does not wash out
            the text. Getting CSS stacking contexts, backdrop blurs, and radial
            gradients to cooperate across desktop and mobile took enough coffee to
            power a small data center.
          </p>
          <p>
            <strong className="text-white">6. DYNAMIC ISLAND &amp; SHINING TEXT:</strong>{" "}
            Up top, there is an expanding Dynamic Island search bar that filters
            games by title, verdict, or recommendation on the fly, plus an Intro
            pill you can literally drag left-to-right to unlock a whole second rant
            screen with animated canvas waves. Even the Intro text has a custom
            ping-pong metallic shine animation tuned to sweep back and forth at
            exactly seven seconds.
          </p>
          <p>
            <strong className="text-white">7. ZERO DATA COLLECTION &amp; ZERO WARRANTIES:</strong>{" "}
            Because this is a test site, all game scores, match percentages, and
            curated metrics shown on screen are demonstration data crafted to
            showcase the interface. By clicking Accept (or Decline, since both
            buttons close this popup so you can explore the site anyway), you
            acknowledge that this is a test environment built for fun, visual craft,
            and experimentation.
          </p>
          <p>
            <strong className="text-white">8. FINAL CLAUSE:</strong>{" "}
            If you actually scrolled all the way to the bottom of this massive wall
            of text inside a 192-pixel-tall scroll box, you officially have more
            patience than the developer who wrote it. Enjoy exploring the Fluid Flow
            test site, click every button, drag the Intro pill, test the mobile
            menu dots, and may your next game always be a Perfect 9.5/10 instead of
            a Time Waste.
          </p>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          variant="outline"
          data-testid="terms-decline-btn"
          onClick={() => {
            setDecision("declined")
            onDecline?.()
          }}
        >
          Decline
        </Button>
        <Button
          data-testid="terms-accept-btn"
          onClick={() => {
            setDecision("accepted")
            onAccept?.()
          }}
        >
          Accept
        </Button>
      </CardFooter>
    </Card>
  )
}
