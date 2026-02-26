const Linkedin = ({
                             size = 24,
                             color = "currentColor",
                             className = ""
                         }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="LinkedIn"
            className={className}
        >
            <path
                d="M20.447 20.452h-3.554v-5.569c0-1.327-.025-3.036-1.849-3.036-1.849 0-2.131 1.445-2.131 2.939v5.666H9.359V9h3.414v1.561h.049c.476-.9 1.637-1.849 3.368-1.849 3.601 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.814 20.452H3.861V9h2.953v11.452z"/>
        </svg>
    );
};

export default Linkedin;