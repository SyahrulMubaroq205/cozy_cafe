import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = ({ children }) => {
    return (
        <div className="container max-w-7xl mx-auto">
            <Header />
            <div className="flex flex-1">
                {children} {/* children sidebar + content */}
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
