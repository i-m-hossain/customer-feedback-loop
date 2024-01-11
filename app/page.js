"use client";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/config/routes";
import LocalStorage from "@/lib/localStorage";
import { toast } from "react-toastify";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleClick = (confirm) => {
    if (confirm) {
      fetchData();
      router.push("/survey/1");
      return;
    }
    toast("Please consider participating the survey", {
      position: "top-center",
      autoClose: 50000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(routes.surveyEndpoint);
      const data = await response.json();
      LocalStorage.set("surveyQuestions", data?.surveys?.surveys);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };
  return (
    <main className="flex flex-col items-center justify-center gap-y-4">
      <div className="text-center">
        <p>Do you want to participate in the survey?</p>
        <div className="flex justify-center mt-2 gap-x-6">
          {loading ? (
            <h2>Loading...</h2>
          ) : (
            <>
              <Button onClick={() => handleClick(true)}>Yes</Button>
              <Button onClick={() => handleClick(false)}>No</Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
