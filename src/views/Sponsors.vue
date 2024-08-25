<template>
  <div>
    <main class="flex-1">
      <section id="sponsors" class="py-16 px-6 bg-muted">
        <div class="container mx-auto max-w-4xl">
          <h2 class="text-3xl font-bold mb-8">Our Sponsors</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <img src="https://gravatar.com/avatar/361a331e88af15ea5f7f81cdd60a6633e7bc4a69db43b236caae96cdcb1ddd03?s=1024" width="400" height="300" alt="Sponsor 1" class="rounded-t-lg" />
              </CardHeader>
              <CardContent>
                <CardTitle>Sponsor 1</CardTitle>
                <CardDescription>
                  Sponsor 1 has been a long-time supporter of our team, providing xxx support
                  that has been essential to our success.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <img src="https://gravatar.com/avatar/361a331e88af15ea5f7f81cdd60a6633e7bc4a69db43b236caae96cdcb1ddd03?s=1024" width="400" height="300" alt="Sponsor 2" class="rounded-t-lg" />
              </CardHeader>
              <CardContent>
                <CardTitle>Sponsor 2</CardTitle>
                <CardDescription>
                  Sponsor 2 has been a long-time supporter of our team, providing xxx support
                  that has been essential to our success.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <img src="https://gravatar.com/avatar/361a331e88af15ea5f7f81cdd60a6633e7bc4a69db43b236caae96cdcb1ddd03?s=1024" width="400" height="300" alt="Sponsor 3" class="rounded-t-lg" />
              </CardHeader>
              <CardContent>
                <CardTitle>Sponsor 3</CardTitle>
                <CardDescription>
                  Sponsor 3 has been a long-time supporter of our team, providing xxx support
                  that has been essential to our success.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Card from '../components/Card.vue';
import CardHeader from '../components/CardHeader.vue';
import CardTitle from '../components/CardTitle.vue';
import CardDescription from '../components/CardDescription.vue';
import CardContent from '../components/CardContent.vue';

export default defineComponent({
  components: {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  },
});
</script>
