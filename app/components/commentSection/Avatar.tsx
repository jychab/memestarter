import Image from "next/image";
import React from "react";
import logo from "../../public/logo.png";

type AvatarProps = {
  sourceImage: string;
  username: string;
};

const Avatar = (props: AvatarProps) => {
  const username = props.username;

  return (
    <Image
      className={`rounded`}
      width={32}
      height={32}
      src={props.sourceImage != "" ? props.sourceImage : logo}
      alt={username}
    />
  );
};

export default Avatar;
