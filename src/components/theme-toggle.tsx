"use client"

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
				<Sun className="h-4 w-4" />
			</Button>
		);
	}

	const current = resolvedTheme || theme;

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(current === "dark" ? "light" : "dark")}
			aria-label="Toggle dark mode"
			title={`Switch to ${current === "dark" ? "light" : "dark"} mode`}
		>
			{current === "dark" ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
		</Button>
	);
}

export default ModeToggle;
