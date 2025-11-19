import Link from "next/link";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

const NavLinkItems = ({ toggleNav, navItemType }) => {
  const currentUrlPath = usePathname();
  // navItemType -> vertical or horizontal

  return (
    <ul>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath === "/" && "text-sky-500"}`}
          shallow={true}
          href="/"
        >
          Home
        </Link>
      </li>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath === "/profile" && "text-sky-500"}`}
          shallow={true}
          href="/profile"
        >
          Profile
        </Link>
      </li>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath.startsWith("/batch") && "text-sky-500"}`}
          shallow={true}
          href="/batch"
        >
          Batch
        </Link>
      </li>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath.startsWith("/posts") && "text-sky-500"}`}
          shallow={true}
          href="/posts"
        >
          Posts
        </Link>
      </li>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath === "/gallery" && "text-sky-500"}`}
          shallow={true}
          href="/gallery"
        >
          Gallery
        </Link>
      </li>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath.startsWith("/chat") && "text-sky-500"}`}
          shallow={true}
          href="/chat"
        >
          Chat
        </Link>
      </li>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath.startsWith("/seminar") && "text-sky-500"}`}
          shallow={true}
          href="/seminar"
        >
          Seminar
        </Link>
      </li>
      <li onClick={toggleNav}>
        <Link
          className={`${currentUrlPath === "/about" && "text-sky-500"}`}
          shallow={true}
          href="/about"
        >
          About
        </Link>
      </li>
    </ul>
  );
};

export default NavLinkItems;
