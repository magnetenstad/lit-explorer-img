# LitExplorer: A Visual Browser for Literature Collections

![image](https://github.com/info-vis-24/lit-explorer/assets/46494695/a6e9af41-078f-447a-8378-54d69af3fcc6)

## How it Works

LitExplorer needs nothing more than a `.bib` file, and a folder of associated images. See [`.bib` Fields](#bib-fields) for how to optimally structure you `.bib` file. See [Getting Started](#getting-started) for how to link your images correctly, as well as how to build and deploy.


### `.bib` Fields

#### Default `.bib` Fields

No fields are required, but LitExplorer works best if you include:

- `author` (any conventional format)
- `title`
- `date` (`year` is also accepted)
- `doi`
- `abstract`

#### Custom `.bib` Fields

To make full use of LitExplorer, you should also include:

- `category`: To categorize your papers. One entry may have multiple comma-separated categories.
- `name`: To indicate that multiple papers belong to the same system. More specialized than `category`.

Check out `public/references.bib` for an example! (The fields `figure` and `figure-xref` are artifacts of another project and may be disregarded).

## Getting Started

Follow these steps to host LitExplorer with your own literature collection:

1. Clone this repository
2. Run `npm install`
3. Replace `public/references.bib` with your literature collection
4. Add your images to `public/img/thumbnail` and `public/img/raw`. Remember to name the images the same as the key of the associated `.bib` entry.
5. Run `npm run dev` to host the site locally

### Build and Deploy

Run `npm run build` to build the site to `dist`, and host the contents.

### Build and Deploy with GitHub Pages

A GitHub deploy action is included in `.github/workflows/deploy.yaml`, for hosting with GitHub Pages. This action will deploy the site after each pushed commit to `main`. Make sure that your GitHub repository has GitHub Pages enabled, and configured to host with GitHub Actions.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

