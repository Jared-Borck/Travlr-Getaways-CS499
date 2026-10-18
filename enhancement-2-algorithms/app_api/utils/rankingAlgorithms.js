const RATING_WEIGHTS = {
    qualityRating: 0.30,
    destinationRating: 0.25,
    valueRating: 0.20,
    accommodationRating: 0.15,
    activitiesRating: 0.10
};

/**
 * Calculates the average weighted score for a collection of reviews.
 *
 * Each review has five ratings from 1 through 5.
 */
const calculateWeightedScore = (reviews) => {
    if (!reviews || reviews.length === 0) {
        return 0;
    }

    let totalScore = 0;

    for (const review of reviews) {
        const reviewScore =
            review.qualityRating * RATING_WEIGHTS.qualityRating +
            review.destinationRating * RATING_WEIGHTS.destinationRating +
            review.valueRating * RATING_WEIGHTS.valueRating +
            review.accommodationRating * RATING_WEIGHTS.accommodationRating +
            review.activitiesRating * RATING_WEIGHTS.activitiesRating;

        totalScore += reviewScore;
    }

    return Number((totalScore / reviews.length).toFixed(2));
};

/**
 * Groups reviews by trip code using a Map.
 *
 * This avoids repeatedly searching the entire review collection
 * when calculating the score for each trip.
 */
const groupReviewsByTrip = (reviews) => {
    const reviewMap = new Map();

    for (const review of reviews) {
        if (!reviewMap.has(review.tripCode)) {
            reviewMap.set(review.tripCode, []);
        }

        reviewMap.get(review.tripCode).push(review);
    }

    return reviewMap;
};

/**
 * Compares two ranked trips.
 *
 * Positive means tripA should rank higher.
 * Negative means tripB should rank higher.
 */
const compareTripQuality = (tripA, tripB) => {
    if (tripA.weightedScore !== tripB.weightedScore) {
        return tripA.weightedScore - tripB.weightedScore;
    }

    if (tripA.reviewCount !== tripB.reviewCount) {
        return tripA.reviewCount - tripB.reviewCount;
    }

    return tripB.name.localeCompare(tripA.name);
};

/**
 * Merges two already-sorted arrays.
 */
const mergeRankings = (left, right) => {
    const merged = [];

    let leftIndex = 0;
    let rightIndex = 0;

    while (
        leftIndex < left.length &&
        rightIndex < right.length
    ) {
        const comparison = compareTripQuality(
            left[leftIndex],
            right[rightIndex]
        );

        if (comparison >= 0) {
            merged.push(left[leftIndex]);
            leftIndex++;
        } else {
            merged.push(right[rightIndex]);
            rightIndex++;
        }
    }

    while (leftIndex < left.length) {
        merged.push(left[leftIndex]);
        leftIndex++;
    }

    while (rightIndex < right.length) {
        merged.push(right[rightIndex]);
        rightIndex++;
    }

    return merged;
};

/**
 * Sorts all ranked trips using merge sort.
 *
 * Time complexity: O(n log n)
 * Space complexity: O(n)
 */
const mergeSortRankings = (rankings) => {
    if (rankings.length <= 1) {
        return [...rankings];
    }

    const middle = Math.floor(rankings.length / 2);

    const left = mergeSortRankings(
        rankings.slice(0, middle)
    );

    const right = mergeSortRankings(
        rankings.slice(middle)
    );

    return mergeRankings(left, right);
};

/**
 * Min-heap used for finding the highest-ranked K trips.
 *
 * The weakest trip currently in the heap remains at the root.
 */
class MinHeap {
    constructor(compareFunction) {
        this.heap = [];
        this.compare = compareFunction;
    }

    size() {
        return this.heap.length;
    }

    peek() {
        if (this.heap.length === 0) {
            return null;
        }

        return this.heap[0];
    }

    push(value) {
        this.heap.push(value);
        this.heapifyUp(this.heap.length - 1);
    }

    replaceRoot(value) {
        if (this.heap.length === 0) {
            this.push(value);
            return;
        }

        this.heap[0] = value;
        this.heapifyDown(0);
    }

    toArray() {
        return [...this.heap];
    }

    heapifyUp(index) {
        let currentIndex = index;

        while (currentIndex > 0) {
            const parentIndex = Math.floor(
                (currentIndex - 1) / 2
            );

            if (
                this.compare(
                    this.heap[currentIndex],
                    this.heap[parentIndex]
                ) >= 0
            ) {
                break;
            }

            this.swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
        }
    }

    heapifyDown(index) {
        let currentIndex = index;

        while (true) {
            const leftChildIndex =
                currentIndex * 2 + 1;

            const rightChildIndex =
                currentIndex * 2 + 2;

            let smallestIndex = currentIndex;

            if (
                leftChildIndex < this.heap.length &&
                this.compare(
                    this.heap[leftChildIndex],
                    this.heap[smallestIndex]
                ) < 0
            ) {
                smallestIndex = leftChildIndex;
            }

            if (
                rightChildIndex < this.heap.length &&
                this.compare(
                    this.heap[rightChildIndex],
                    this.heap[smallestIndex]
                ) < 0
            ) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex === currentIndex) {
                break;
            }

            this.swap(currentIndex, smallestIndex);
            currentIndex = smallestIndex;
        }
    }

    swap(firstIndex, secondIndex) {
        const temporary = this.heap[firstIndex];

        this.heap[firstIndex] =
            this.heap[secondIndex];

        this.heap[secondIndex] =
            temporary;
    }
}

/**
 * Finds the highest-ranked K trips using a min-heap.
 *
 * Instead of sorting every trip, the heap stores only the
 * strongest K trips seen so far.
 *
 * Processing complexity: O(n log k)
 * Heap space complexity: O(k)
 */
const getTopKTrips = (rankings, k) => {
    if (k <= 0 || rankings.length === 0) {
        return [];
    }

    const heap = new MinHeap(compareTripQuality);

    for (const trip of rankings) {
        if (heap.size() < k) {
            heap.push(trip);
            continue;
        }

        const weakestTopTrip = heap.peek();

        if (
            compareTripQuality(
                trip,
                weakestTopTrip
            ) > 0
        ) {
            heap.replaceRoot(trip);
        }
    }

    // Only the K selected trips are sorted for presentation.
    return mergeSortRankings(heap.toArray());
};

/**
 * Combines trip records and review information into
 * ranking records.
 */
const buildTripRankings = (trips, reviews) => {
    const reviewMap = groupReviewsByTrip(reviews);

    const rankings = [];

    for (const trip of trips) {
        const tripReviews =
            reviewMap.get(trip.code) || [];

        rankings.push({
            code: trip.code,
            name: trip.name,
            resort: trip.resort,
            image: trip.image,
            reviewCount: tripReviews.length,
            weightedScore:
                calculateWeightedScore(tripReviews)
        });
    }

    return rankings;
};

module.exports = {
    RATING_WEIGHTS,
    calculateWeightedScore,
    groupReviewsByTrip,
    compareTripQuality,
    mergeSortRankings,
    MinHeap,
    getTopKTrips,
    buildTripRankings
};