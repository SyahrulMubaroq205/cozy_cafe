const Card = ({ title, value }) => {
    return (
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 shadow-lg text-white">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
};

export default Card;
