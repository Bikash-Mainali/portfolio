const LeftArrow = ({
                           size = 16,
                           color = "currentColor",
                           strokeWidth = 2,
                           className = "",
                           ...props
                       }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
    );
};

export default LeftArrow;