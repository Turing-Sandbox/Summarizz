"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { apiURL } from "@/app/scripts/api";

//models
import { User } from "@/models/User";
import { Content } from "@/models/Content"

//components
import UserResult from "@/components/search/userResult";
import ContentResult from "@/components/search/contentResult";
import Navbar from "@/components/Navbar";

//styles
import "@/app/styles/search/search.scss"

const SearchList = () => {


  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------

  // Retrieve the search text from the url.
  const param = useSearchParams().get("query");
  const [usersReturned, setUsersReturned] = useState([]);
  const [contentReturned, setContentReturned] = useState([]);

  const [userStartingPoint, setUserStartingPoint] = useState(null);
  const [contentStartingPoint, setContentStartingPoint] = useState(null);


  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------

  // Fetch both user data and content data on first page load.
  useEffect(() => {
    fetchUserData();
    fetchContentData();
  }, [])

  /**
   * fetchUserData() -> void
   *
   * @description
   *Send a get request to the api endpoint for searching for users.
   *
   * @returns void
   */
  const fetchUserData = async () => {
    const response = await axios.get(`${apiURL}/search/users/`, {
      params: {
        searchText: param,
        userStartingPoint: userStartingPoint,
      }
    });
    setUsersReturned(prev => [...prev, ...response.data.documents]);
    setUserStartingPoint(response.data.newStartingPoint);
  }

  /**
   * fetchUserData() -> void
   *
   * @description
   *Send a get request to the api endpoint for searching for articles.
   *
   * @returns void
   */
  const fetchContentData = async () => {
    const response = await axios.get(`${apiURL}/search/content/`, {
      params: {
        searchText: param,
        contentStartingPoint: contentStartingPoint
      }
    });
    setContentReturned(prev => [...prev, ...response.data.documents]);
    setContentStartingPoint(response.data.newStartingPoint);
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="searchResults">
          <h1>Search Results for: {param}</h1>
          <h2>Users</h2>
          <ul>
            {usersReturned?.length === 0 ? <h3>Nothing found...</h3>
              : usersReturned.map((user: User, index) => (
                <li key={index} className="searchItem"><UserResult user={user} /></li>
              ))}
          </ul>
          <button className="fetchMoreButton" onClick={fetchUserData}>Fetch more items</button>

          <h2>Content</h2>
          <ul>
            {contentReturned?.length === 0 ? <h3>Nothing found...</h3>
              : contentReturned.map((content: Content, index) => (
                <li key={index} className="searchItem"><ContentResult content={content} /></li>
              ))}
          </ul>
          <button className="fetchMoreButton" onClick={fetchContentData}>Fetch more Content</button>
        </div>
      </div>
    </>
  );
};

export default SearchList;
