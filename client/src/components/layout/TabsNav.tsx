import { TabNav } from "@radix-ui/themes";
import { Link, useLocation } from "react-router";

const TAB_ROUTES = [
	{ label: "Users", path: "/users" },
	{ label: "Roles", path: "/roles" },
];

export function TabsNav() {
	const { pathname } = useLocation();

	return (
		<TabNav.Root aria-label="Section navigation">
			{TAB_ROUTES.map((tab) => (
				<TabNav.Link
					key={tab.path}
					active={pathname.startsWith(tab.path)}
					asChild
				>
					<Link to={tab.path}>{tab.label}</Link>
				</TabNav.Link>
			))}
		</TabNav.Root>
	);
}
