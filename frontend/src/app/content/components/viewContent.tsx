"use client";

import Navbar from "@/app/components/Navbar";
import "../styles/content.scss";
import { useEffect, useRef, useState } from "react";
import { apiURL } from "@/app/scripts/api";
import { Content } from "../models/Content";

interface ViewContentProps {
  id: string;
}

export default function ViewContent({ id }: ViewContentProps) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [contents, setContents] = useState<Content>();

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------
  const hasFetchedData = useRef(false);
  useEffect(() => {
    if (!hasFetchedData.current) {
      getContent();
      hasFetchedData.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  function getContent(contentId: string) {
    axios.get(`${apiURL}/content/${contentId}`).then((res) => {
      setContents((prevContents) => [...prevContents, res.data]);
    });
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <Navbar />
      <div className='main-content'>
        <h1>{user?.username}</h1>
        {/* <img src={user.profilePicture} alt='Profile Picture' /> */}

        <p>
          {user?.firstName} {user?.lastName}
        </p>
        <p>{user?.bio}</p>

        <h2>Content</h2>
        <div className='content-list'>
          {contents.map((content, index) => (
            <div key={content.id || index} className='content-list-item'>
              <h3>{content.title}</h3>
              <p>{content.content}</p>
              {/* Load thumbnail image from URL */}
              <Image
                src={content.thumbnail}
                alt='Thumbnail'
                width={200}
                height={200}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

}
