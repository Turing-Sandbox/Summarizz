"use client";

import { Content } from "@/models/Content";
import { useRouter } from "next/navigation";

const ContentResult = ({ content }: { content: Content }) => {
  const router = useRouter();

  /**
   * handleClick() -> void
   *
   * @description
   * On a click, this redirects the user to the selected content's page.
   *
   * @returns void
   */
  const handleClick = () => {
    router.push(`/content/${content.id}`);
  };

  return (
    <div className='contentSearchResults' onClick={handleClick}>
      <img
        src={content.thumbnail}
        alt={``}
        className='search-content-thumbnail'
      />
      <h3>{content.title}</h3>
    </div>
  );
};

export default ContentResult;
