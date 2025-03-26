<template>
    <div class="legal-page">
        <main class="content">
            <div class="container">
                <h2 class="page-title">Terms of Service</h2>

                <div class="policy-section">
                    <h3>Introduction</h3>
                    <p>These Terms of Service govern your use of our application Robotics Control WebAPP. By using our
                        application, you agree to these terms.</p>
                </div>

                <div class="policy-section">
                    <h3>Use of Application</h3>
                    <p>You may use our application for personal, non-commercial purposes only. You may not use our
                        application in any way that violates any applicable laws or regulations.</p>
                </div>

                <div class="policy-section">
                    <h3>Intellectual Property</h3>
                    <p>All content, including text, images, and software, contained in our application is our property
                        or the property of our licensors. You may not copy, modify, or distribute any of this content
                        without our permission.</p>
                </div>

                <div class="policy-section">
                    <h3>Termination</h3>
                    <p>We may terminate your use of our application at any time, with or without cause.</p>
                </div>

                <div class="policy-section">
                    <h3>Disclaimer of Warranties</h3>
                    <p>Our application is provided "as is" without any warranties of any kind. We disclaim all
                        warranties, express or implied, including the warranties of merchantability, fitness for a
                        particular purpose, and non-infringement.</p>
                </div>

                <div class="policy-section">
                    <h3>Limitation of Liability</h3>
                    <p>In no event shall we be liable for any indirect, incidental, special, or consequential damages
                        arising out of or in connection with the use of our application.</p>
                </div>

                <div class="policy-section">
                    <h3>Governing Law</h3>
                    <p>These Terms of Service are governed by the laws of the United States. Any disputes arising out of
                        or in connection with these Terms of Service shall be resolved in the courts of the United
                        States.</p>
                </div>

                <div class="policy-section">
                    <h3>Contact Us</h3>
                    <p>If you have any questions about these Terms of Service, please <a
                            href="https://www.team695.com/contact/" class="contact-link">contact us</a>.</p>
                </div>
            </div>
        </main>

        <!-- <footer class="footer">
            <div class="container">
                <p>&copy; {{ new Date().getFullYear() }} Team 695 Bison Robotics. All rights reserved.</p>
                <div class="footer-links">
                    <a href="#" class="footer-link">Privacy Policy</a>
                    <a href="#" class="footer-link">Terms of Service</a>
                    <a href="https://www.team695.com/contact/" class="footer-link">Contact</a>
                </div>
            </div>
        </footer> -->
    </div>
</template>

<style scoped>
.legal-page {
    font-family: 'Inter', 'Roboto', sans-serif;
    color: #333;
    line-height: 1.6;
    background-color: #f9f9f9;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.content {
    flex: 1;
    padding: 2rem 0;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #222;
    border-bottom: 2px solid #ffcc00;
    padding-bottom: 0.5rem;
}

.policy-section {
    margin-bottom: 2rem;
}

.policy-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #222;
}

.policy-section p,
.policy-section li {
    margin-bottom: 1rem;
    font-size: 1rem;
}

.policy-section ul {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
}

.contact-link {
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
}

.contact-link:hover {
    text-decoration: underline;
}

.footer {
    background-color: #333;
    color: #fff;
    padding: 1.5rem 0;
    margin-top: 2rem;
}

.footer .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer p {
    margin: 0;
    font-size: 0.875rem;
}

.footer-links {
    display: flex;
    gap: 1.5rem;
}

.footer-link {
    color: #fff;
    text-decoration: none;
    font-size: 0.875rem;
}

.footer-link:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .header {
        flex-direction: column;
        padding: 1rem;
        gap: 1rem;
    }

    .navigation {
        width: 100%;
        justify-content: space-between;
    }

    .footer .container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}
</style>