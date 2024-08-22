const Layout = (props) => {
  return (
    <div className="bg-base-100 h-screen grid grid-cols-1 place-content-center bg-[url('../../assets/images/noise.svg')]">
      {props.children}
    </div>
  );
}

export default Layout;
