import React from "react";
import Contributor from "./Contributor";

const ProjectContributor = ({ contributor }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center hover:shadow-xl transition-transform transform hover:-translate-y-2">
      <Contributor contributor={contributor} />
    </div>
  );
};

export default ProjectContributor;