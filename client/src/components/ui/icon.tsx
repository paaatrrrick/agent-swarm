import { HamburgerMenuIcon, TwitterLogoIcon, GitHubLogoIcon, Cross1Icon, EyeOpenIcon, EnvelopeOpenIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import clsx from "clsx"


type validIconTypes = "hamburger" | "github" | "twitter" | "Cross1Icon" | "EyeOpenIcon" | "EnvelopeOpenIcon"


const iconMap = {
    hamburger: HamburgerMenuIcon,
    github: GitHubLogoIcon,
    twitter: TwitterLogoIcon,
    Cross1Icon: Cross1Icon,
    EyeOpenIcon: EyeOpenIcon,
    EnvelopeOpenIcon: EnvelopeOpenIcon,
}


export default function Icon({ type, onClick, hideBorder }: { type: validIconTypes, onClick: () => void, hideBorder?: boolean }) {
    const Icon = iconMap[type]
    return (
        <Button variant="outline" size="icon" onClick={onClick} className={clsx(!hideBorder && "dark:border dark:border-border", "hover:bg-background bg-secondary")}>
            <Icon className="h-[62%] w-[62%] text-primary" />
        </Button>
    )
}
