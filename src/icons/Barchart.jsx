export default function VerticalBarChartIcon({
                                                 size = 24,
                                                 colors = {
                                                     bar1: "#FF473E",
                                                     bar2: "#00B1FF",
                                                     bar3: "#A97DFF",
                                                     border: "#B9C5C6"
                                                 },
                                                 className = ""
                                             }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Vertical Bar Chart Icon"
            className={className}
        >
            <title>Vertical Bar Chart Icon</title>
            {/* Red bar */}
            <path
                fill={colors.bar1}
                d="M183.96 483.418H82.669V137.39c0-12.364 10.023-22.387 22.387-22.387h56.517c12.364 0 22.387 10.023 22.387 22.387v346.028z"
            />
            {/* Blue bar */}
            <path
                fill={colors.bar2}
                d="M318.431 483.418H217.14V296.187c0-12.364 10.023-22.387 22.387-22.387h56.517c12.364 0 22.387 10.023 22.387 22.387v187.231z"
            />
            {/* Purple bar */}
            <path
                fill={colors.bar3}
                d="M452.902 483.418h-101.29V80.91c0-12.364 10.023-22.387 22.387-22.387h56.517c12.364 0 22.387 10.023 22.387 22.387v402.508z"
            />
            {/* Border around the chart */}
            <path
                fill={colors.border}
                d="M478.685 489.418H32a7 7 0 0 1-7-7V40a7 7 0 1 1 14 0v435.418h439.685a7 7 0 1 1 0 14z"
            />
        </svg>
    );
}