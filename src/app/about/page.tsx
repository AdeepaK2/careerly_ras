"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const team = [
  {
    name: "Adeepa Kularathna",
    role: "Lead",
    image: "/team/Adeepa Kularathna.png",
  },
  {
    name: "Sulakshani Dissanayake",
    role: "Member",
    image: "/team/Sulakshani Dissanayake.jpg",
  },
  {
    name: "Thishani Dissanayake",
    role: "Member",
    image: "/team/Thishani Dissanayake.jpg",
  },
  {
    name: "Akith Chandinu",
    role: "Member",
    image: "/team/Akith Chandinu.jpg",
  },
  {
    name: "Renulucshmi Prakasan",
    role: "Member",
    image: "/team/Renulucshmi Prakasan.jpg",
  },
  {
    name: "Nilum Mudaliarachchi",
    role: "Member",
    image: "/team/Nilum Mudaliarachchi.jpg",
  },
  {
    name: "Nethmal Gunawardhana",
    role: "Member",
    image: "/team/Nethmal Gunawardhana.jpg",
  },
  {
    name: "Hashiru Gunathilake",
    role: "Member",
    image: "/team/Hashiru Gunathilake.jpg",
  },
  {
    name: "Garuka Satharasinghe",
    role: "Member",
    image: "/team/Garuka Satharasinghe.jpg",
  },
  {
    name: "Dulmini Munasinghe",
    role: "Member",
    image: "/team/Dulmini Munasinghe.jpg",
  },
  {
    name: "Dananjaya Bandara",
    role: "Member",
    image: "/team/Dananjaya Bandara.jpeg",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 md:px-24 max-w-7xl mx-auto w-full">
        <section className="w-full flex flex-col md:flex-row items-center justify-between gap-8 mb-32 mt-10">
          <div className="flex-1 flex flex-col items-center md:items-start justify-center text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 tracking-tight leading-tight">
              A project by
              <br />
              IEEE RAS UoM
            </h1>
            <p className="text-gray-600 max-w-xl text-sm md:text-xl font-medium">
              This is a dummy description about the project. Careerly is a
              platform created to connect undergraduates and companies, making
              career opportunities more accessible and meaningful for everyone
              involved.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center mt-0">
            <img src="/RAS_SB.PNG" alt="RAS Logo" className="w-full -ml-8" />
          </div>
        </section>
        <h1 className="text-3xl md:text-4xl font-bold text-center gradient-text mb-2">
          Meet Our Team
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
          {team.map((member) => (
            <div
              key={member.name}
              className="w-52 h-[250px] bg-black text-white rounded-2xl flex flex-col overflow-hidden"
            >
              <div className="relative flex-shrink-0 h-[200px] overflow-hidden rounded-t-2xl">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover object-top hover:scale-105 transition-all duration-300"
                />
                <div className="absolute bottom-0 z-10 h-32 w-full bg-gradient-to-t pointer-events-none from-black to-transparent"></div>
              </div>
              <div className="flex-1 flex flex-col justify-center px-2 pb-4 text-center">
                <p className="text-sm">{member.name}</p>
                <p className="text-sm font-medium bg-gray-400 text-transparent bg-clip-text">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        
      </main>
      <Footer />
    </div>
  );
}
