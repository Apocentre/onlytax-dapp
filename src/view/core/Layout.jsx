import Footer from "../components/Footer";
const Layout = (props) => {
  return (
    <div className="bg-base-100 h-screen flex flex-col w-screen">
      {/* <header class="bg-white">Header</header> */}
      <div id="header">Header</div>
      <div id="main" class="grid grid-cols-1 flex-grow place-content-center">
        {props.children}
      </div>
      <div id="footer">
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
