export type CategoryId = "graphic-design" | "branding" | "motion-design" | "video-editing";

export type Category = { id: CategoryId; label: string; short: string };

export const CATEGORIES: Category[] = [
  { id: "graphic-design", label: "Graphic Design", short: "Graphic Design" },
  { id: "branding", label: "Branding & Visual Identity", short: "Branding & Identity" },
  { id: "motion-design", label: "Motion Design", short: "Motion Design" },
  { id: "video-editing", label: "Video Editing", short: "Video Editing" },
];

// portrait 4:5, square 1:1, landscape 4:3, wide 16:9
export type ProjectShape = "portrait" | "square" | "landscape" | "wide";

export type Project = {
  slug: string;
  title: string;
  category: CategoryId;
  description: string;
  year: string;
  media: "image" | "video";
  shape: ProjectShape;
  /** e.g. "/projects/<slug>/poster.jpg" (a file inside /public) */
  poster?: string;
  /** a short muted loop, e.g. "/projects/<slug>/preview.mp4" */
  preview?: string;
  featured: boolean;
};

const PLACEHOLDER_DESCRIPTION =
  "A short description of the project, the idea behind it and the result.";

// Placeholders: replace each one with real work as the files arrive.
export const PROJECTS: Project[] = [
  {
    slug: "project-01",
    title: "Project Title 01",
    category: "graphic-design",
    description: PLACEHOLDER_DESCRIPTION,
    year: "2026",
    media: "image",
    shape: "portrait",
    featured: true,
  },
  {
    slug: "project-02",
    title: "Project Title 02",
    category: "motion-design",
    description: PLACEHOLDER_DESCRIPTION,
    year: "2026",
    media: "video",
    shape: "wide",
    featured: true,
  },
  {
    slug: "project-03",
    title: "Project Title 03",
    category: "branding",
    description: PLACEHOLDER_DESCRIPTION,
    year: "2026",
    media: "image",
    shape: "square",
    featured: true,
  },
  {
    slug: "project-04",
    title: "Project Title 04",
    category: "graphic-design",
    description: PLACEHOLDER_DESCRIPTION,
    year: "2026",
    media: "image",
    shape: "square",
    featured: true,
  },
  {
    slug: "project-05",
    title: "Project Title 05",
    category: "video-editing",
    description: PLACEHOLDER_DESCRIPTION,
    year: "2026",
    media: "video",
    shape: "wide",
    featured: true,
  },
  {
    slug: "project-06",
    title: "Project Title 06",
    category: "motion-design",
    description: PLACEHOLDER_DESCRIPTION,
    year: "2026",
    media: "video",
    shape: "portrait",
    featured: true,
  },
];

export const getFeaturedProjects = () => PROJECTS.filter((project) => project.featured);

export const getProjectsByCategory = (category: CategoryId) =>
  PROJECTS.filter((project) => project.category === category);