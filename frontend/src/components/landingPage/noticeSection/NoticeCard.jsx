import * as React from "react";
import Link from "next/link";

const NoticeCard = ({ noticeLink, notice_name }) => {
  return (
    <Link
      className="flex rounded-lg text-white transition-transform duration-300 items-center justify-center w-full m-2 md:w-[22%] text-sm md:text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 hover:scale-105 hover:shadow-lg p-4 text-center"
      target="_blank"
      href={noticeLink}
    >
      {notice_name}
    </Link>
  );
};

export default NoticeCard;