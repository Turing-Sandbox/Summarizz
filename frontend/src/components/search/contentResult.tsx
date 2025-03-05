"use client";

import { Content } from "@/models/Content";
import { useRouter } from "next/navigation";


const UserResult = ({ content }: { content: Content }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/content/${content.id}`);
  };

  return (
    <div className="contentSearchResults" onClick={handleClick}>
      <img className="thumbnail" src={content.thumbnail} alt={``} />
      <h1>{content.title}</h1>
    </div>
  );
};

export default UserResult;
