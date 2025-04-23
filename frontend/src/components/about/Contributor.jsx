"use client";
import React from "react";
import UserAvatar from "@/components/header/UserAvatar";
import Link from "next/link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GithubIcon from "@mui/icons-material/GitHub";

const Contributor = ({ contributor }) => {
  return (
    <div className="flex flex-col items-center">
      <UserAvatar
        profileUrl={contributor.image}
        className="w-40 h-40 rounded-full mb-4 border-4 border-blue-500 shadow-md"
      />
      <p className="text-xl font-semibold text-gray-800 mb-2">
        {contributor.name}
      </p>
      <div className="flex space-x-4">
        <Link
          href={contributor.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          <LinkedInIcon fontSize="large" />
        </Link>
        <Link
          href={contributor.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-gray-900"
        >
          <GithubIcon fontSize="large" />
        </Link>
      </div>
    </div>
  );
};

export default Contributor;
