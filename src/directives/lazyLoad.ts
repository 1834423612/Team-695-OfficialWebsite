// 图片懒加载指令
export const lazyLoad = {
    mounted(el: HTMLImageElement) {
        function loadImage() {
            const imageElement = Array.from(el.children).find(
                (el) => el.nodeName === "IMG"
            ) as HTMLImageElement;

            if (imageElement) {
                imageElement.addEventListener("load", () => {
                    setTimeout(() => {
                        imageElement.classList.add("loaded");
                    }, 100);
                });

                imageElement.addEventListener("error", () => {
                    console.error("Error loading image");
                });

                imageElement.src = imageElement.dataset.url || "";
            }
        }

        function handleIntersect(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadImage();
                    observer.unobserve(el);
                }
            });
        }

        function createObserver() {
            const options = {
                root: null,
                threshold: 0.1,
                rootMargin: "0px",
            };
            const observer = new IntersectionObserver(handleIntersect, options);
            observer.observe(el);
        }

        if (window["IntersectionObserver"]) {
            createObserver();
        } else {
            loadImage();
        }
    },
};