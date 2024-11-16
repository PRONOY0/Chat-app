/* eslint-disable no-unused-vars */
import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useEffect, useRef, useState } from "react";
import { IoArrowBack, IoFileTrayStackedSharp } from "react-icons/io5";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
  HOST,
  REMOVE_PROFILE_IMAGE_ROUTE,
} from "@/utils/constants";

import { colors, getColor } from "@/lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.selectedColor);
    }

    if (userInfo.image) {
      setImage(`${HOST}/${userInfo.image}`);
    }
  }, []);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is required.");
      return false;
    }

    if (!lastName) {
      toast.error("Last Name is required.");
      return false;
    }

    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName,
            lastName,
            color: selectedColor,
          },
          {
            withCredentials: true,
          }
        );

        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data });
          toast.success("Profile updated successfully.");
          navigate("/chat");
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please setup Profile.");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    console.log({ file });
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);

      try {
        const response = await apiClient.post(
          ADD_PROFILE_IMAGE_ROUTE,
          formData,
          { withCredentials: true }
        );

        if (response.status === 200 && response.data.image) {
          setUserInfo({ ...userInfo, image: response.data.image });
          toast.success("Image updated successfully");
        }

        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
      }

      toast.success("Image removed successfully");
      setImage(null);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="h-[100vh] bg-[#1b1c24] flex items-center justify-center gap-10 flex-col">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div>
          <IoArrowBack
            onClick={handleNavigate}
            className="text-4xl lg:text-6xl text-white/90 cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-2">
          <div
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
            onMouseEnter={() => {
              setHovered(true);
            }}
            onMouseLeave={() => {
              setHovered(false);
            }}
          >
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )}`}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo.email.split("").shift()}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                onClick={image ? handleDeleteImage : handleFileInputClick}
                className="absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              name="profile-image"
              accept=".png, .jpg, .jpeg, .svg, .webp"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
            <div className="w-full">
              <Input
                name="email"
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>

            <div className="w-full">
              <Input
                name="first name"
                placeholder="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>

            <div className="w-full">
              <Input
                name="last name"
                placeholder="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>

            <div className="w-full gap-5 flex">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`${color} h-8 w-8 cursor-pointer transition-all duration-300 rounded-full ${
                    selectedColor === index
                      ? "outline outline-white/50 outline-1"
                      : ""
                  }`}
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <Button
          className="h-16 w-full bg-purple-700 hover:bg-purple-500 transition-all duration-300"
          onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
