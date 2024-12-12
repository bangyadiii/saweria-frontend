import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";

async function LandingPage() {
  const session = await getServerSession();
  return (
    <div className="">
      <div className="text-center flex items-center flex-col">
        <Logo />
        <p className="font-medium text-4xl">
          Connecting Communities, Empowering Streamers
        </p>
      </div>
      {!session?.user && (
        <div className="flex gap-5 justify-center ml-auto my-5">
          <Link href="/login">
            <Button className="bg-sky-300">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Register</Button>
          </Link>
        </div>
      )}

      <Card className="bg-green-50">
        <CardContent>
          <p>
            Saweria helps you to receive financial support from your fans with
            these payment methods:
          </p>
          <div className="flex justify-between">
            <table className="text-start">
              <thead className="">
                <tr className="">
                  <th>Indonesia</th>
                  <th>Philipines</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <li>OVO</li>
                  </td>
                  <td>
                    <li>MAYA</li>
                  </td>
                </tr>
                <tr>
                  <td>
                    <li>GOPAY</li>
                  </td>
                  <td>
                    <li>MAYA</li>
                  </td>
                </tr>
                <tr>
                  <td>
                    <li>DANA</li>
                  </td>
                  <td>
                    <li>MAYA</li>
                  </td>
                </tr>
              </tbody>
            </table>
            <Image
              src={"images/chicken_money.svg"}
              alt="chiken money"
              width={200}
              height={200}
            />
          </div>
          <p>
            You can easily cashout to all banks and e-wallet in Indonesia /
            Philipines
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 mt-10">
        <CardContent>
          <ol className="list-decimal">
            <li>Register your account</li>
            <li>Verify your account</li>
            <li>Choose and set your overlay</li>
            <li>Don’t forget to put the QR and your Saweria link</li>
            <li>Say thank you to your tipper!</li>
          </ol>
        </CardContent>
      </Card>
      <div className="flex items-center flex-col mt-8">
        <Image
          src={"images/capy_happy.svg"}
          alt="capy happy"
          width={300}
          height={300}
        />
        <p className="text-2xl ">ready to join saweria?</p>
        <Button className="mt-3">Register</Button>
      </div>
    </div>
  );
}

export default LandingPage;
