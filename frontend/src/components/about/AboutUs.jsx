"use client";
import React from "react";
import ProjectContributor from "./ProjectContributor";

const AboutUs = () => {
  const contributors = [
    {
      id: "22ucs112",
      name: "Lakshya Jangid",
      image: "/images/22ucs112.jpg",
      linkedIn: "https://www.linkedin.com/in/lakshya-jangid/",
      github: "https://github.com/lakshyajangid28",
    },
    {
      id: "22ucs127",
      name: "Mridul Sharma",
      image: "/images/22ucs127.jpg",
      linkedIn: "https://www.linkedin.com/in/mridul-sharma/",
      github: "https://github.com/mridul-sharma",
    },
    {
      id: "22ucs062",
      name: "Devansh Vyas",
      image: "/images/22ucs062.jpg",
      linkedIn: "https://www.linkedin.com/in/devansh-vyas/",
      github: "https://github.com/devansh-vyas",
    },
  ];

  return (
    <section className="bg-gray-100 dark:bg-gray-900 min-h-screen pt-16 px-8 transition-colors duration-300">
      <div className="max-w-full">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">About Us</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          Welcome to the LNMIIT Alumni Connect platform! We are a team of
          passionate students from{" "}
          <a
            href="https://lnmiit.ac.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-400 font-semibold hover:underline"
          >
            LNMIIT, Jaipur
          </a>
          , dedicated to bridging the gap between alumni and current students.
          Our mission is to create a collaborative space where alumni and
          students can connect, share experiences, and grow together.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          This platform is a testament to our commitment to fostering a strong
          and supportive community. We extend our heartfelt gratitude to our
          Faculty Supervisor,{" "}
          <span className="text-blue-700 dark:text-blue-400 font-semibold">
            Dr. Kanjalochan Jena
          </span>
          , for his invaluable guidance and encouragement throughout this
          journey.
        </p>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Our Vision</h2>
        <ul className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-12">
          <li>
            Build a unified platform to connect all LNMIIT alumni and students
            for networking and mentorship opportunities.
          </li>
          <li>
            Empower students to learn from alumni experiences and enhance their
            professional growth.
          </li>
          <li>
            Strengthen the LNMIIT community by organizing events, alumni meets,
            and collaborative initiatives.
          </li>
        </ul>
      </div>

      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8">Our Contributors</h1>
        <div className="flex flex-wrap gap-8">
          {contributors.map((contributor, index) => (
            <ProjectContributor key={index} contributor={contributor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;