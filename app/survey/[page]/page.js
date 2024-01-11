"use client";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { constants, routes } from "@/config/routes";
import Button from "@/components/Button";
import { GrFormPreviousLink } from "react-icons/gr";
import { GrFormNextLink } from "react-icons/gr";

import LocalStorage from "@/lib/localStorage";
import { questionTypes } from "@/utils/questionTypes";
import { toast } from "react-toastify";
import axios from "axios";
import { SurveyContext } from "@/app/Provider";

const Survey = () => {
  const param = useParams();
  const pageNumber = parseInt(param.page);
  const [data, setData] = useState([]);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isFirstPage, setIsFirstPage] = useState(false);
  const [pageData, setPageData] = useState();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { data: surveyData, setData: setSurveyData } =
    useContext(SurveyContext);
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = LocalStorage.get("surveyQuestions");
    if (q) {
      setData(q);
    } else if (surveyData.length > 0) {
      setData(surveyData);
    } else {
      fetchData();
    }
  }, [surveyData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(routes.surveyEndpoint);
      const data = await response.json();
      setSurveyData(data?.surveys?.surveys);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };
  useEffect(() => {
    setIsLastPage(
      pageNumber === Math.ceil(data?.length / constants.questionPerPage)
    );
    setIsFirstPage(pageNumber === 1);
    const pData = data?.slice(
      (pageNumber - 1) * constants.questionPerPage,
      pageNumber * constants.questionPerPage
    );
    setPageData(pData);
    // setting initail answer state base on input type
    const obj = {};
    pData?.forEach((q) => {
      obj[q.id] = q.answers;
    });
    setAnswers(obj);
  }, [data, pageNumber]);

  const checkValidation = () => {
    const firstQuestion = pageNumber * constants.questionPerPage - 1;
    const secondQuestion = pageNumber * constants.questionPerPage;
    const q1Validate = Object.values(answers[firstQuestion]).some(
      (item) => item
    );
    const q2Validate = answers.hasOwnProperty(secondQuestion)
      ? Object.values(answers[secondQuestion]).some((item) => item)
      : true;
    if (!q1Validate || !q2Validate) {
      return false;
    }
    return true;
  };

  const handlePrev = () => {
    const updatedData = data.map((item) => {
      if (answers.hasOwnProperty(item.id)) {
        return { ...item, answers: answers[item.id] };
      }
      return item;
    });
    LocalStorage.set("surveyQuestions", updatedData);
    setSurveyData(updatedData);
    router.push("/survey/" + (pageNumber - 1));
  };

  const handleNext = () => {
    if (!checkValidation()) {
      toast.error("Please answer the questions before moving to next page", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }

    const updatedData = data.map((item) => {
      if (answers.hasOwnProperty(item.id)) {
        return { ...item, answers: answers[item.id] };
      }
      return item;
    });
    LocalStorage.set("surveyQuestions", updatedData);
    setSurveyData(updatedData);
    axios.post("/api/survey", updatedData);
    router.push("/survey/" + (pageNumber + 1));
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!checkValidation()) {
      toast.error("Please answer the questions before submitting", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      return;
    }
    setIsSubmitted(true);
    const updatedData = data.map((item) => {
      if (answers.hasOwnProperty(item.id)) {
        return { ...item, answers: answers[item.id] };
      }
      return item;
    });
    axios.post("/api/survey", updatedData);
    LocalStorage.remove("surveyQuestions");
    const onConfirm = () => {
      router.push("/");
      setSurveyData([]);
    };
    const onCancel = () => {
      router.push("/finish");
      setSurveyData([]);
    };
    toast(
      <Msg
        message={{
          first: "Your feedback has been submitted.",
          second: "Do you want to try another survey?",
        }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
      {
        position: toast.POSITION.TOP_CENTER, // Customize the position
        autoClose: false,
        closeButton: false,
      }
    );
  };
  const handleChange = (questionId, e) => {
    const type = e.target.type;
    const value = e.target.value;
    const checked = e.target.checked;
    if (type === "checkbox") {
      const object = { ...answers };
      object[questionId] = { ...object[questionId], [value]: checked };

      setAnswers((prev) => ({
        ...prev,
        ...object,
      }));
    }
    if (type === "radio") {
      const choiceItems = { ...answers[questionId] };
      Object.keys(choiceItems).map((item) => (choiceItems[item] = false));
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...choiceItems,
          [value]: checked,
        },
      }));
    }
    if (type === "textarea") {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          text: value,
        },
      }));
    }
  };
  const RenderItem = (item, handleChange) => {
    if (item.type === questionTypes.single.name) {
      return (
        <div id="question" className="flex flex-col gap-y-2">
          <label>
            Q{item.id}. {item.question}
          </label>
          {Object.keys(item?.choices).map((choice) => (
            <div className="flex gap-x-2 pl-8" key={choice}>
              <input
                className="form-check-input"
                name={`question${item.id}`}
                id={`question${item.id}-choice${choice}`}
                type="radio"
                value={choice}
                onChange={(e) => handleChange(item.id, e)}
                checked={answers[item.id][choice]}
              />
              <label
                className="form-check-label"
                htmlFor={`question${item.id}-choice${choice}`}
              >
                {item.choices[choice]}
              </label>
            </div>
          ))}
        </div>
      );
    } else if (item.type === questionTypes.multi.name) {
      return (
        <div id="question" className="flex flex-col gap-y-2">
          <label>
            Q{item.id}. {item.question}
          </label>
          {Object.keys(item?.choices).map((choice) => (
            <div className="flex gap-x-2 pl-8" key={choice}>
              <input
                className="form-check-input"
                name={`question${item.id}`}
                id={`question${item.id}-choice${choice}`}
                type="checkbox"
                value={choice}
                onChange={(e) => handleChange(item.id, e)}
                checked={answers[item.id][choice]}
              />
              <label
                className="form-check-label"
                htmlFor={`question${item.id}-choice${choice}`}
              >
                {item.choices[choice]}
              </label>
            </div>
          ))}
        </div>
      );
    } else if (item.type === questionTypes.openend.name) {
      return (
        <div id="question" className="flex flex-col gap-y-2">
          <label>
            Q{item.id}. {item.question}
          </label>
          <div className="pl-8">
            <textarea
              placeholder="Enter your answer"
              className="border rounded p-2 outline-none"
              value={answers[item.id]["text"]}
              onChange={(e) => handleChange(item.id, e)}
            ></textarea>
          </div>
        </div>
      );
    }
  };
  function Msg({ closeToast, toastProps, message, onCancel, onConfirm }) {
    return (
      <div>
        <p className="text-center text-black">{message.first}</p>
        <h2 className="text-center font-semibold text-black">
          {message.second}
        </h2>

        <div className="flex justify-center gap-8 py-8 text-black">
          <Button
            onClick={() => {
              onConfirm();
              closeToast();
            }}
          >
            Yes, Start
          </Button>
          <Button
            onClick={() => {
              closeToast();
              onCancel();
            }}
          >
            No, Finish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <h2 className="text-center">Loading...</h2>
      ) : (
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-y-4">
              {pageData?.map((item, index) => (
                <React.Fragment key={index}>
                  {RenderItem(item, handleChange)}
                </React.Fragment>
              ))}
            </div>
            {!isSubmitted && (
              <div className="pt-8 flex gap-16 justify-center">
                {!isFirstPage ? (
                  <Button
                    disabled={isFirstPage}
                    onClick={handlePrev}
                    type="button"
                  >
                    <GrFormPreviousLink />
                    <span>Prev</span>
                  </Button>
                ) : (
                  <span></span>
                )}
                {isLastPage ? (
                  <Button type="submit">Submit</Button>
                ) : (
                  <Button
                    disabled={isLastPage}
                    onClick={handleNext}
                    type="button"
                  >
                    <span>Next</span>
                    <GrFormNextLink />
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
};

export default Survey;
