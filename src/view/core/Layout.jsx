import Footer from "../components/Footer";
import Header from "../components/Header";

const Layout = (props) => {
  return (
    <div className="bg-base-100 h-screen flex flex-col w-screen">
      <div id="header">
        <Header />
      </div>
      <div id="main" className="flex flex-col flex-grow place-content-center">
        {props.children}
      </div>
      <div id="footer">
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
