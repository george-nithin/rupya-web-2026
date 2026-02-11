"use client";

import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";
import { useEffect, useRef } from "react";

interface TVChartProps {
    data: { time: string; open: number; high: number; low: number; close: number }[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const TVChart = ({ data, colors = {} }: TVChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: colors.backgroundColor || "transparent" },
                textColor: colors.textColor || "#cbd5e1",
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            grid: {
                vertLines: { color: "rgba(255, 255, 255, 0.05)" },
                horzLines: { color: "rgba(255, 255, 255, 0.05)" },
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#4ade80",
            downColor: "#ef4444",
            borderVisible: false,
            wickUpColor: "#4ade80",
            wickDownColor: "#ef4444",
        });

        candlestickSeries.setData(data);

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [data, colors]);

    return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};
