# FRC Team 695 Bison Robotics - Official Website

## First Version Released 🎉
![Team 695 Website-compressed](https://github.com/user-attachments/assets/c69422fd-eafc-44bc-b02f-a619dbf27a04)

## Website Links
[https://www.team695.com/](https://www.team695.com/)
[https://www.frc695.com/](https://www.frc695.com/)

## Tech Stacks

See https://github.com/1834423612/Team-695-OfficialWebsite/blob/master/package.json

<details>
<summary>Dependencies Details</summary>

Some dependencies
</details>

# Run the Project
### 1. Download Node.JS

Go to the official website of [Node.JS](https://nodejs.org/en), and choose **LTS Version**.  
Local development uses version `v20.9.0` (probably, any version higher than this version can run successfully. etc. `v22.13.0`).

### 2. Download Git

Go to [Git Download for Windows](https://git-scm.com/download/win), and choose the **64-bit version**.

### 3. Pull the Project to the local

![image](https://github.com/1834423612/scoutify_test/assets/49981661/69727590-8de1-4e3b-948c-aafc2f432978)

```shell
git clone https://github.com/1834423612/Team-695-OfficialWebsite.git
```

```shell
cd Team-695-OfficialWebsite
```

### 4. Install Project dependencies
We recommend using `pnpm` to replace `npm` to manage packages.  

```shell
pnpm install
```

**Only use this command when you change the `package.json` or the first time you run it.**

### 5. Run the Website

```shell
pnpm run dev
```

![image](https://github.com/1834423612/scoutify_test/assets/49981661/024ad2e1-fb38-4a6b-ae44-f100bdc683c4)

When the terminal shows the local preview link, that means success!

----
### Where are the files?!

<details>
  <summary>Details</summary>
  <h3>The default page</h3>
  
  ![image](https://github.com/1834423612/scoutify_test/assets/49981661/6517e928-5fec-4b16-b3a5-4da2db546eaa)
  
  At path: <code>/src/views/index.vue</code>


  <h3>The components locate</h3>

  ![image](https://github.com/1834423612/scoutify_test/assets/49981661/76a5d4eb-3042-4d03-b94e-0b3375cb2f2c)

  In order to facilitate the later maintenance of components, the relevant functional codes are stored in the <code>/src/components/</code> directory.

  <b>Make sure after you create the new components, import those into the `index.vue`!!!</b>

  ### Example import code:
**Be sure you changed the example name `YourComponentsName` (lol**

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
    import YourComponentsName from '../components/<YourComponentName>.vue';
    
    export default {
      components: {
        YourComponentsName // Register This component, has the same name when you import
      }
    };
    </script>

```
----
</details>

