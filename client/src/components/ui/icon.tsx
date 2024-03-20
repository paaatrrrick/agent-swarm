import { HamburgerMenuIcon, TwitterLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import clsx from "clsx"


type validIconTypes = "hamburger" | "github" | "twitter"


const iconMap = {
    hamburger: HamburgerMenuIcon,
    github: GitHubLogoIcon,
    twitter: TwitterLogoIcon,
}


export default function Icon({ type, onClick, hideBorder }: { type: validIconTypes, onClick: () => void, hideBorder?: boolean }) {
    const Icon = iconMap[type]
    return (
        <Button variant="outline" size="icon" onClick={onClick} className={clsx(!hideBorder && "dark:border dark:border-border", "hover:bg-background bg-secondary")}>
            <Icon className="h-[62%] w-[62%] text-primary " />
        </Button>
    )
}
