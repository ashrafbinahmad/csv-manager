import React, { ReactNode } from "react";
import { BiBox, BiSolidDashboard, BiTable } from "react-icons/bi";
import { IconContext } from "react-icons/lib";
import { MdDashboard } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
interface ISideBarMenuItem {
  icon: ReactNode;
  label: string;
  link: string;
}

export default function Sidebar() {
  const sidebarMenuItems: ISideBarMenuItem[] = [
    {
      icon: <BiSolidDashboard />,
      label: "Dashboard",
      link: "/dashboard",
    },
    {
      icon: <BiBox />,
      label: "Imports",
      link: "/csv-files",
    },
    {
      icon: <BiTable />,
      label: "Batch Types",
      link: "/batch-types",
    },
  ];
  return (
    <aside className="bg-[#F8F8F7] h-[100dvh] w-full border-r border-r-[#DFDFDE} overflow-hidden">
      <div className="p-1 mt-[150px] grid gap-2">
        {sidebarMenuItems.map((i) => (
          <SidebarMenuItem key={i.link} {...i} />
        ))}
      </div>
    </aside>
  );
}

function SidebarMenuItem(props: ISideBarMenuItem) {
  const location = useLocation();

  return (
    <Link
      to={props.link}
      className={`grid grid-cols-[40px_auto] items-center  py-1 px-2 rounded-sm whitespace-nowrap text-gray-700 hover:text-gray-800 text-sm font-medium ${
        location.pathname === props.link ? "bg-gray-200" : ""
      }`}
    >
      <IconContext.Provider value={{ size: "22px" }}>
        {props.icon}
      </IconContext.Provider>
      {props.label}
    </Link>
  );
}
