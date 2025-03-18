"use client";

import SearchList from "@/components/search/searchList";

/**
 * Page() -> JSX.Element
 *
 * @description
 * Renders the Create Content page, allowing users to create content.
 *
 * @returns JSX.Element
 */
export default function Page() {
  return (
    <>
      <div className='main-content'>
        <SearchList />
      </div>
    </>
  );
}
