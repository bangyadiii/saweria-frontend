import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import CapyHappy from "../../../public/images/capy_happy.svg";
import ChickenMoney from "../../../public/images/chicken_money.svg";
import DoggoHappy from "../../../public/images/doggo_happy.svg";
import RaccoonHappy from "../../../public/images/raccoon_happy.svg";

const menus = [
  {
    title: "Overlay",
    description:
      "Atur Alert dan overlay lainnya di sini. Kompatibel dengan OBS dan Streamlabs",
    Icon: CapyHappy,
    backgroundColor: "bg-emerald-200",
    path: "/overlay",
  },
  {
    title: "Dukungan Masuk dan Cashout",
    description: "Lihat histori dukungan yang masuk dan cashout di sini.",
    Icon: ChickenMoney,
    backgroundColor: "bg-purple-300",
    path: null,
  },
  {
    title: "Dukungan Keluar",
    description: "Lihat histori dukungan yang keluar di sini.",
    Icon: DoggoHappy,
    backgroundColor: "bg-amber-400",
    path: null,
  },
  {
    title: "Integration",
    description: "Hubungkan aplikasi pihak ketiga dengan saweria.",
    Icon: RaccoonHappy,
    backgroundColor: "bg-red-300",
    path: null,
  },
];

function Dashboard() {
  return (
    <div className="">
      <div className="grid gap-2 md:gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-10">
        {menus.map((menu, index) => (
          <Link key={"menu_" + index + menu.title} href={menu.path || "/"}>
            <Card
              variant="button"
              className={`h-[300px] ${menu.backgroundColor} m-3 md:m-0`}
            >
              <CardHeader>
                <div className="flex justify-between">
                  <span className="text-3xl font-sans">{menu.title}</span>
                  <menu.Icon className="w-[100px]" />
                </div>
              </CardHeader>
              <CardContent className="font-mono flex gap-3 justify-between">
                <p>{menu.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
