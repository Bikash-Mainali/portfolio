import { Link } from "react-router";

export default function BrandName({className = '', to, onClick}) {
    const content = (
        <span className={`font-display text-2xl sm:text-3xl font-bold ${className}`}>{'BM'}</span>
    );

    if (to) {
        return (
            <Link to={to} onClick={onClick} className="inline-block">
                {content}
            </Link>
        );
    }

    return content;
}