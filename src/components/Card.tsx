type CardProps = {
    title: string
    icon: string
    description: string
}

function Card({title, icon, description }: CardProps){
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">{icon}</div>

            <h2 className="text-xl font-bold text-gray-800">
                {title}
            </h2>
            <p className="text-gray-500 mt-2">
                {description}
            </p>
        </div>
    )
}
export default Card