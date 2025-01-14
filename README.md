# FRC Team 695 Bison Robotics - Official Website
![Team-695-Official-Website-Design-2024-v1.png](https://github.com/user-attachments/assets/c69422fd-eafc-44bc-b02f-a619dbf27a04)

## First Version Released 🎉
The first version of the website has been released! Check out the latest **[release notes](https://github.com/1834423612/Team-695-OfficialWebsite/releases/latest)** for more details.

## Project Overview
The official website for FRC Team 695 Bison Robotics, a competitive robotics team from Beachwood High School, founded in 2001. This website serves as a platform to engage students in a hands-on STEM environment and showcase the team's activities and achievements.

## Website Links
- [Team 695 | Bison Robotics(team695.com)](https://www.team695.com/)
- [Team 695 | Bison Robotics(frc695.com)](https://www.frc695.com/)

## Tech Stacks
For details on the technology stacks used, refer to the [package.json](https://github.com/1834423612/Team-695-OfficialWebsite/blob/master/package.json) file.

<details>
<summary>Dependencies Details</summary>

Some dependencies are listed here for reference.
</details>

## Running the Project
To run the project locally, follow these steps:

### 1. Download Node.JS
Visit the official [Node.JS](https://nodejs.org/en) website and download the **LTS Version**. The local development uses version `v20.9.0`, but any version higher than this should work successfully (e.g., `v22.13.0`).

### 2. Download Git
Go to [Git Download for Windows](https://git-scm.com/download/win) and download the **64-bit version**.

### 3. Pull the Project to Local
Clone the repository using the following command:
```shell
git clone https://github.com/1834423612/Team-695-OfficialWebsite.git
```

Navigate to the project directory:
```Shell
cd Team-695-OfficialWebsite
```

### 4. Install Project Dependencies
We recommend using `pnpm` to manage packages. Install the dependencies with:
```Shell
pnpm install
```
**Note**: Use this command only when you change the `package.json` or the first time you run the project.

### 5. Run the Website
Start the development server with:
```Shell
pnpm run dev
```
When the terminal displays the local preview link, the website is successfully running!

## File Structure
<details>
<summary>Details</summary>

## Default Page
The default page is located at `/src/views/index.vue`.

## Components Location
Components are stored in the `/src/components/` directory to facilitate maintenance. After creating new components, ensure they are imported into index.vue.

</details>

## Example Import Code
**Replace `YourComponentsName` with the actual component name.**

```vue
<template>
  ...
  <div>
    <!-- Import the components -->
    <!-- Same as your import name -->
    <YourComponentsName />
  </div>
  ...
</template>

<script>
import YourComponentsName from '../components/YourComponentName.vue';

export default {
  components: {
    YourComponentsName // Register this component, matching the import name
  }
};
</script>
```

