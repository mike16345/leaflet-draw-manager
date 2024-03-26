import { ReactNode } from "react";

interface ControlBtnProps {
  onclick: () => void;
  className?: string;
  active?: boolean;
  children?: ReactNode;
  content?: string;
  eventInEnd?: boolean;
}

const buttonBg = (flag: boolean) =>
  flag ? "bg-black bg-opacity-90" : "bg-black bg-opacity-50";
const textColor = (flag: boolean) => (flag ? "text-[yellow]" : " text-white");

const ControlBtn = ({
  onclick,
  className,
  active = false,
  children,
  content,
  eventInEnd = false,
}: ControlBtnProps) => {
  return (
    <div
      onClick={onclick}
      className={`w-12  h-12 p-1 flex justify-center items-center text-center cursor-pointer border-solid  border-[#3d454ebd] border-2  ${className} ${textColor(
        active
      )}  ${buttonBg(active)} hover:scale-105`}
    >
      {content && <p className={`font-bold	 ${textColor(active)}`}>{content}</p>}
      {children}
    </div>
  );
};
export default ControlBtn;
