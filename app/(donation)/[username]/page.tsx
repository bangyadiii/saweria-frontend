import React from "react";

function DonationPage({ params }: Readonly<{ params: { username: string } }>) {
  return <div>{params.username}</div>;
}

export default DonationPage;
