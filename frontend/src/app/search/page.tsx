"use client";

import AuthProvider from "@/hooks/AuthProvider";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
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
			<Background />
			<AuthProvider>
				<SearchList />
				<div className='footer'>
					<Footer />
				</div>
			</AuthProvider>
		</>
	);
}
