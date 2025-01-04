const Loader = () => {
    return (
        <div className="flex items-center justify-center m-10 p-10">

            <div className="flex-col gap-4 w-full flex items-center justify-center">
                <div
                    className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
                >
                    <div
                        className="w-16 h-16 border-4 border-transparent text-[#359D9E] text-2xl animate-spin flex items-center justify-center border-t-[#359D9E] rounded-full"
                    ></div>
                </div>
            </div>

        </div>
    );
};

export default Loader;

