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
import Error from "next/error";

const SearchList = () => {


  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------

  // Retrieve the search text from the url.
  const param = useSearchParams().get("query");
  const [usersReturned, setUsersReturned] = useState([]);
  const [userDisabled, setUserDisabled] = useState(false);
  const [contentReturned, setContentReturned] = useState<Content[]>([]);
  const [contentDisabled, setContentDisabled] = useState(false);

  const [userStartingPoint, setUserStartingPoint] = useState(null);
  const [contentStartingPoint, setContentStartingPoint] = useState(null);

  const [fetching, setFetching] = useState(false);

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
    if (!param) { return; }

    if (fetching) {
      alert("Already Fetching!!!!");
      return;
    }
    setFetching(true)

    try {
      const response = await axios.get(`${apiURL}/search/users/`, {
        params: {
          searchText: param,
          userStartingPoint: userStartingPoint,
        }
      });

      const newDocuments = response.data.documents;
      // Create a set to easily check if the last query has duplicates
      const usersSet = new Set(usersReturned.map((doc: { id: string }) => { doc.id }));
      // Create a get each user document id from the GET response, then check 
      // for whether at least one is not in the stored user set.
      const uniqueDocuments = newDocuments.filter((doc: { id: string }) => {
        return !usersSet.has(doc.id)
      });

      // If there are unique documents, update the state
      if (uniqueDocuments.length > 0 && !fetching) {
        setUsersReturned(prev => [...prev, ...uniqueDocuments]);
        // Update the starting point for the next fetch
        setUserStartingPoint(uniqueDocuments[uniqueDocuments.length - 1].usernameLower);
      } else {
        // If there are no unique documents, disable the button
        setUserDisabled(true);
      }
    } catch (error: any) {
      alert(`USER FETCHING ERROR: ${error}`)
      console.error("User fetching error: ", error)
      throw new Error(error);
    } finally {
      setFetching(false)
    }
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
    if (!param) { return; }

    if (fetching) {
      alert("Already Fetching!!!!");
      return;
    }
    setFetching(true)

    try {
      const response = await axios.get(`${apiURL}/search/content/`, {
        params: {
          searchText: param,
          contentStartingPoint: contentStartingPoint
        }
      })

      // Obtain the documents from the response data.
      const newDocuments = response.data.documents;
      // Create a set to easily check if the last query has duplicates
      const contentSet = new Set(contentReturned.map((doc: Content) => { doc.id }));
      // Get each document id from the GET response, then check 
      // for whether at least one is not in the stored content set.
      const uniqueDocuments = newDocuments.filter((doc: { id: string }) => {
        return !contentSet.has(doc.id)
      });

      // If there are unique documents, update the state
      if (uniqueDocuments.length > 0 && !fetching) {
        // Append the new data to the list of stored articles.
        setContentReturned(prev => [...prev, ...uniqueDocuments]);
        // Update the starting point for the next fetch.
        setContentStartingPoint(uniqueDocuments[uniqueDocuments.length - 1].titleLower);
      } else {
        // If no unique documents, disable the button.
        setContentDisabled(true);
      }
    } catch (error: any) {
      alert(`CONTENT ERROR ${error}`)
      console.error("Error fetching contents: ", error)
      throw new Error(error)
    } finally {
      setFetching(false)
    }
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
          <button className="fetchMoreButton" onClick={fetchUserData} disabled={userDisabled}>Fetch more items</button>

          <h2>Content</h2>
          <ul>
            {contentReturned?.length === 0 ? <h3>Nothing found...</h3>
              : contentReturned.map((content: Content, index) => (
                <li key={index} className="searchItem"><ContentResult content={content} /></li>
              ))}
          </ul>
          <button className="fetchMoreButton" onClick={fetchContentData} disabled={contentDisabled}>Fetch more Content</button>
        </div>
      </div>
    </>
  );
};

export default SearchList;
