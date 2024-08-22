const Layout = (props) => {
  return (
    <div class="h-screen grid grid-cols-2 place-content-center bg-[url('../assets/images/noise.svg')] bg-[#262624]">
      {props.children}
    </div>
  );
}

export default Layout;
