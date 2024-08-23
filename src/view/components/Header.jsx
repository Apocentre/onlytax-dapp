import ConnectBtn from "./ConnectBtn";

const Header = () => {
	return (
    <div className="grid grid-cols-1 sm:text-center md:grid-cols-4 p-4">
      <div className="md:col-start-4 sm:col-start-1 w-full">
        <ConnectBtn />
      </div>
    </div>
	)
}

export default Header
