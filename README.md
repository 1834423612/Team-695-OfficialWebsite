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

### 3. Get this repository link
Go to [Team Official Website - FrontEnd Repository](https://github.com/1834423612/Team-695-OfficialWebsite) and follow the steps:  
Select `Code` &#10132; `Local` &#10132; `HTTPS`, then copy the link.

![image](https://github.com/user-attachments/assets/198174e8-2966-4ee9-ad0b-ad97e03f7bd3)

### 4. Pull the Project to your Local
Commands can be executed using `cmd`, `PowerShell`, `git bash` (Windows System), or `shell(terminal)` (Linux System).

<details>
  <summary><b>See Screenshot Image (Windows CMD)</b></summary>

  ----  
  ![image](https://github.com/user-attachments/assets/43a90974-20af-4fb7-9457-e1edc975262b)
  ----
</details>

Clone the repository using the following command:
```Shell
git clone https://github.com/1834423612/Team-695-OfficialWebsite.git
```

Navigate to the project directory:
```Shell
cd Team-695-OfficialWebsite
```

### 5. Install Project Dependencies
<details>
  <summary><b>See Screenshot Image</b></summary>

  ----  
  ![image](https://github.com/user-attachments/assets/7eaa4774-5ab3-483c-ab9c-5c231d5f5212)
  ----

</details>

We recommend using `pnpm` to manage packages. Install the dependencies with:
```Shell
pnpm install
```

**Note**: 
  - Use this command only when you change the `package.json`, add/update new dependencies, or the first time you run the project.
  - Once you run `pnpm install`, you should be able to see that it will generate one folder: `node_modules`, and one file: `pnpm-lock.yaml`.

#### If your device is a fresh install environment/without `pnpm`, please run the installation below to your global environment first:
<details>
  <summary><b>See Screenshot Image</b></summary>

  ----  
  ![image](https://github.com/user-attachments/assets/1024b960-5891-4ba7-8bc9-d7017764f573)
  ----

</details>

```Shell
npm install -g pnpm
```
```Shell
pnpm setup
```

#### If you want to remove a package or all packages:
**Remove the specified package(s):**
`CMD`, `PowerShell`, `Git Bash`, or `Shell(Terminal)`:
```Shell
pnpm remove <PackageName1> <PackageName2> <PackageName3...>
```

**Remove all packages(If something is wrong in your localhost):**
**Notes BEFORE YOU RUN:**
  - ONLY Works on `PowerShell(Windows)`, or `Terminal(Linux)`
  - You just need to copy and paste the following commands,
  - if you are not familiar with them please do not modify any of the commands.
  - For Windows systems, you can also delete the corresponding folder directly by right-clicking on it in the graphical interface (due to the file system, deletion of the `node_modules` folder may time out or take a long time).
  - THINK FIRST, THEN DECIDED RUN OR NOT

```Shell
rm ./pnpm-lock.yaml
```
```Shell
rm ./node_modules
```

### 6. Run the Website
Start the `development` server with:
```Shell
pnpm run dev
```
When the terminal displays the local preview link, the website is successfully running!

Build the `Production` environment & Upload it to the server:
```Shell
pnpm build
```
Then, all the static codes will located in the `/dist` folder. Upload them all to the server.


## File Structure
<details>
<summary>Details</summary>

### Default Page
The default page is located at `/src/views/index.vue`.

### Components Location
Components are stored in the `/src/components/` directory to facilitate maintenance.  
After creating new components, ensure they are imported into `/views/YourPage.vue`.

### Example Import Code
**Replace `YourComponentName` with the actual component name.**

`/views/YourPage.vue`:
```vue
<template>
  ...
  <div>
    <!-- Import the components -->
    <!-- Same as your import name -->
    <YourComponentName />
  </div>
  ...
</template>

<script>
import YourComponentName from '../components/YourComponentName.vue';

export default {
  components: {
    YourComponentName // Register this component, matching the import name
  }
};
</script>
```

</details>
