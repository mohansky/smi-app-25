"use client";
import * as React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggler } from "@/components/ui/mode-toggler";
import { options } from "@/.velite";
import AuthButton from "../buttons/auth-button";
// import AuthButton from "../buttons/auth-button";

export default function Navbar() {
  return (
    <NavigationMenu className="my-2">
      <NavigationMenuList className="space-x-2">
        {options.links.map((item, index) => (
          <NavigationMenuItem key={index}>
            <Link href={item.link} passHref>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                title={item.text}
                asChild
              >
                <span>{item.text}</span>
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
        <AuthButton />
        <ModeToggler />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
