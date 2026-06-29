"use client";

import { motion } from "framer-motion";
interface LogoProps {
    collapsed: boolean;
}

export default function Logo({ collapsed }: LogoProps) {
    return (
        <div className="flex h-20 items-center justify-center border-b border-gray-100 px-5 shrink-0">
            <motion.img
                whileHover={{
                    scale: 1.08,
                    rotate: 3,
                }}
                transition={{
                    type: "spring",
                    stiffness: 250,
                }}
                src="#"
                alt="Logo"
                className={`object-contain transition-all duration-300 ${collapsed ? "h-9 w-9" : "h-11 w-auto"
                    }`}
            />
        </div>
    );
}
